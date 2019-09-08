import pyaes
import json
import binascii
import sys

def get_encrypted_data(data, aesKeyFile):
    with open(aesKeyFile, 'r') as file:
        key = file.read().replace('\n', '')

    iv = "InitializationVe"

    ciphertext = ''

    # We can encrypt one line at a time, regardles of length
    encrypter = pyaes.Encrypter(pyaes.AESModeOfOperationCBC(key, iv))
    ciphertext += encrypter.feed(data)

    # Make a final call to flush any remaining bytes and add padding
    ciphertext += encrypter.feed()

    return ciphertext


def get_json_data_item_key(mode, data, aesKeyFile):
    if mode != 1:
        return data

    return binascii.b2a_base64(get_encrypted_data(data, aesKeyFile))

def get_python_code(pythonCode):
    with open(pythonCode, 'r') as file:
        codeContent = file.read()
    return binascii.b2a_base64(codeContent)

def get_taxa_request(appId, methodName, param, data, mode, aesKeyFile, pythonCode, outputFile):
    jsonData = get_json_data_item_key(mode, data, aesKeyFile)

    code = ''
    if pythonCode != '':
        code = get_python_code(pythonCode)

    if mode == 1:
      encodingMode = "base64"
    else:
      encodingMode = "raw"

    taxa_request = {
        "taxa_version": "0",
        "app_id": appId,
        "function": "/" + methodName,
        "param" : param,
        "header" : {"src": "user", "type": "text/plain"},
        "data": jsonData,
        "code": code,
        "content-transfer-encoding":encodingMode
    }

    testString = json.dumps(taxa_request)

    with open(outputFile, 'w+') as file:
        file.write(testString)

def main():
    # data = "".join(["life is wonderful", "life is wonderful"])
    data = str(sys.argv[1]) #'{"name":"john","value":"1"}'
    aesKeyFile = './hack.aes'
    #pythonCode = './testCode.py'
    pythonCode = '../server/game.py'
    outputFile = sys.argv[2] #'./testSessionA'
    methodName = sys.argv[3] #"submit"
    mode = 1
    appId = "testApp"
    #param = None
    param = {"t": "33"}

    get_taxa_request(appId, methodName, param, data, mode, aesKeyFile, pythonCode, outputFile)


if __name__ == '__main__':
    main()
