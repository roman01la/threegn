import bpy
import json


def create_input_link(link):
    return {
        "node": link.from_node.name,
        "socket": link.from_socket.identifier
    }


def create_input(input):
    node = {
        "name": input.name,
        "identifier": input.identifier,
        "type": input.type,
        "links": list(map(create_input_link, input.links)),
        "display_shape": input.display_shape,
        "is_multi_input": input.is_multi_input,
    }
    if input.type == "VALUE" or input.type == "INT" or input.type == "BOOLEAN":
        node["value"] = input.default_value
    elif input.type == "VECTOR":
        node["value"] = list(input.default_value)
    return node


def create_output_link(link):
    return {
        "node": link.to_node.name,
        "socket": link.to_socket.identifier
    }


def create_output(output):
    node = {
        "name": output.name,
        "identifier": output.identifier,
        "type": output.type,
        "links": list(map(create_output_link, output.links)),
        "display_shape": output.display_shape
    }
    if output.type == "VALUE" or output.type == "INT" or output.type == "BOOLEAN":
        node["value"] = output.default_value
    elif output.type == "VECTOR":
        node["value"] = list(output.default_value)
    return node


def create_node(node):
    ret_node = {
        "name": node.name,
        "label": node.label,
        "default_label": node.bl_label,
        "type": node.type,
        "inputs": list(map(create_input, node.inputs)),
        "outputs": list(map(create_output, node.outputs)),
        "color": list(node.color),
        "location": list(node.location),
        "dimensions": list(node.dimensions),
    }
    if node.type == "MATH":
        ret_node["operation"] = node.operation
        ret_node["use_clamp"] = node.use_clamp
    elif node.type == "VECT_MATH":
        ret_node["operation"] = node.operation
    elif node.type == "FILLET_CURVE":
        ret_node["mode"] = node.mode
    return ret_node


def export_geo_nodes():
    nodes = bpy.data.node_groups['Geometry Nodes'].nodes.values()
    json_nodes = list(map(create_node, nodes))
    json_str = json.dumps(json_nodes)
    file = open(r"/Users/romanliutikov/Desktop/nodes.json", "w")
    file.write(json_str)
    file.close()
